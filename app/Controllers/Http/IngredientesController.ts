import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Ingrediente from 'App/Models/Ingrediente'
import Event from '@ioc:Adonis/Core/Event';
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Database from "@ioc:Adonis/Lucid/Database";

export default class IngredientesController {
  public async index ({ request, response }: HttpContextContract) {
    const ingredientes = await Ingrediente.all()
    response.send(ingredientes)
  }
  public async store ({ request, response }: HttpContextContract) {
    const validationSchema = schema.create({
      nombre: schema.string({ trim: true }, [
        rules.required(),
        rules.unique({ table: 'ingredientes', column: 'nombre' }),
      ]),
      tipo: schema.string({ trim: true }, [rules.required()]),
      cantidad: schema.number([rules.required()]),
    })
    const data = await request.validate({
      schema: validationSchema,
      messages: {
        'nombre.required': 'El nombre es requerido',
        'nombre.unique': 'El nombre ya existe',
        'tipo.required': 'El tipo es requerido',
        'cantidad.required': 'La cantidad es requerida',
      },
    })
    if (data) {
      const ingrediente = new Ingrediente()
      ingrediente.nombre = request.input('nombre')
      ingrediente.tipo = request.input('tipo')
      ingrediente.cantidad = request.input('cantidad')
      await ingrediente.save()
      Event.emit('new:ingrediente', ingrediente)
      const respuesta = {
        status: 200,
        message: 'Ingrediente registrado',
        data: ingrediente,
        error: false
      }
      response.send(respuesta)
    }
  }
  public async show ({ params, response }: HttpContextContract) {
    const ingrediente = await Ingrediente.find(params.id)
    response.send(ingrediente)
  }
  public async update ({ params, request, response }: HttpContextContract) {
    const ingrediente = await Ingrediente.find(params.id)
    const validationSchema = schema.create({
      nombre: schema.string({ trim: true }, [
        rules.required()]),
      tipo: schema.string({ trim: true }, [rules.required()]),
      cantidad: schema.number([rules.required()]),
    })
    const data = await request.validate({
      schema: validationSchema,
      messages: {
        'nombre.required': 'El nombre es requerido',
        'tipo.required': 'El tipo es requerido',
        'cantidad.required': 'La cantidad es requerida',
      },
    })
    if (ingrediente) {
      if (data) {
        ingrediente.nombre = request.input('nombre')
        ingrediente.tipo = request.input('tipo')
        ingrediente.cantidad = request.input('cantidad')
        await ingrediente.save()
        Event.emit('update:ingrediente', ingrediente)
        response.send(ingrediente)
      }
    } else {
      response.status(404).send({ message: 'Ingrediente no encontrado' })
    }
  }

  public async destroy ({ params, response }: HttpContextContract) {
    const ingrediente = await Ingrediente.find(params.id)
    if (ingrediente) {
      await ingrediente.delete()
      Event.emit('delete:ingrediente', ingrediente)
      response.send({ message: 'Ingrediente eliminado' })
    } else {
      response.status(404).send({ message: 'Ingrediente no encontrado' })
    }
  }
  public async streamIngredientes({response}){
    const stream = response.response;
    stream.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    })
    Event.on('new:ingrediente', (ingrediente) => {
      stream.write(`se agrego un ingrediente`)
    });
    Event.on('update:ingrediente', (ingrediente) => {
      stream.write(`se modifico un ingrediente`)
    }
    );
    Event.on('delete:ingrediente', (ingrediente) => {
      stream.write(`se elimino un ingrediente`)
    }
    );


  }
}
