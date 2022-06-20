import { prop, getModelForClass } from '@typegoose/typegoose'
import { Document } from 'mongoose'

export class UserSchema {
    @prop({ type: String, required: true, unique: true })
    public jid!: string

    @prop({ type: Number, required: true, default: 0 })
    public experience!: number

    @prop({ type: Boolean, required: true, default: false })
    public banned!: boolean

    @prop({ type: Number, required: true, default: 1 })
    public level!: number

    @prop({ type: String, required: true })
    public tag!: string
}

export type TUserModel = UserSchema & Document

export const userSchema = getModelForClass(UserSchema)
