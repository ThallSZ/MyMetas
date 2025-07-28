import Meta from '#models/meta'
import { createStepValidator, updateStepValidator } from '#validators/step'
import type { HttpContext } from '@adonisjs/core/http'

export default class StepsController {
  async store({ request, auth, params, response }: HttpContext) {
    const user = auth.user!
    const meta = await Meta.query().where('id', params.meta_id).andWhere('user_id', user.id).first()

    if (!meta) {
      return response.notFound({ error: 'Meta não encontrada' })
    }

    const payload = await request.validateUsing(createStepValidator)
    const step = await meta.related('steps').create(payload)

    return response.created(step)
  }

  async update({ params, request, auth, response }: HttpContext) {
    const user = auth.user!
    const meta = await Meta.query().where('id', params.meta_id).andWhere('user_id', user.id).first()

    if (!meta) {
      return response.notFound({ error: 'Meta não encontrada' })
    }

    const step = await meta.related('steps').query().where('id', params.id).first()

    if (!step) {
      return response.notFound({ error: 'Etapa não encontrada' })
    }

    const payload = await request.validateUsing(updateStepValidator)
    step.merge(payload)
    await step.save()

    return response.ok(step)
  }

  async destroy({ params, auth, response }: HttpContext) {
    const user = auth.user!
    const meta = await Meta.query().where('id', params.meta_id).andWhere('user_id', user.id).first()

    if (!meta) {
      return response.notFound({ error: 'Meta não encontrada' })
    }

    const step = await meta.related('steps').query().where('id', params.id).first()

    if (!step) {
      return response.notFound({ error: 'Etapa não encontrada' })
    }

    await step.delete()
    return response.noContent()
  }
}