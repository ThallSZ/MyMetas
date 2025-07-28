import User from '#models/user'
import { createUserValidator, updateUserValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class UsersController {
  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createUserValidator)
    const user = await User.create(payload)

    return response.created(user)
  }

  async show({ auth, response }: HttpContext) {
    const user = auth.user!
    return response.ok(user)
  }

  async update({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const payload = await request.validateUsing(updateUserValidator)

    user.merge(payload)
    await user.save()

    return response.ok(user)
  }

  async destroy({ auth, response }: HttpContext) {
    const user = auth.user!
    await user.delete()
    return response.noContent()
  }
}