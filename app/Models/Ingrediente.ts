import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Ingrediente extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({ columnName: 'nombre', serialize: value => value.charAt(0).toUpperCase() + value.slice(1), consume: value => value.toLowerCase() })
  public nombre: string

  @column({ columnName: 'tipo', serialize: value => value.charAt(0).toUpperCase() + value.slice(1), consume: value => value.toLowerCase() })
  public tipo: string

  @column({ columnName: 'cantidad' })
  public cantidad: number



  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
