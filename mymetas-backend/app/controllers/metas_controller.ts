import Meta from '#models/meta'
import { createMetaValidator, updateMetaValidator } from '#validators/meta'
import type { HttpContext } from '@adonisjs/core/http'

export default class MetasController {
  async index({ auth, response }: HttpContext) {
    const user = auth.user!
    await user.load('metas')

    return response.ok(user.metas)
  }

  async store({ request, auth, response }: HttpContext) {
    const user = auth.user!
    const payload = await request.validateUsing(createMetaValidator)
    const meta = await user.related('metas').create(payload)

    return response.created(meta)
  }

  async show({ params, auth, response }: HttpContext) {
    const user = auth.user!
    const meta = await Meta.query().where('id', params.id).andWhere('user_id', user.id).first()

    if (!meta) {
      return response.notFound({ error: 'Meta não encontrada' })
    }

    return response.ok(meta)
  }

  async update({ params, request, auth, response }: HttpContext) {
    const user = auth.user!
    const meta = await Meta.query().where('id', params.id).andWhere('user_id', user.id).first()

    if (!meta) {
      return response.notFound({ error: 'Meta não encontrada' })
    }

    const payload = await request.validateUsing(updateMetaValidator)
    meta.merge(payload)
    await meta.save()

    return response.ok(meta)
  }

  async destroy({ params, auth, response }: HttpContext) {
    const user = auth.user!
    const meta = await Meta.query().where('id', params.id).andWhere('user_id', user.id).first()

    if (!meta) {
      return response.notFound({ error: 'Meta não encontrada' })
    }

    await meta.delete()

    return response.noContent()
  }
}