import vine from '@vinejs/vine'

export const createMetaValidator = vine.compile(
  vine.object({
    title: vine.string().trim(),
    description: vine.string().trim().optional(),
    date_target: vine.date().optional(),
    status: vine.enum(['a_fazer', 'em_andamento', 'concluida']).optional(),
  })
)

export const updateMetaValidator = vine.compile(
  vine.object({
    title: vine.string().trim().optional(),
    description: vine.string().trim().optional(),
    date_target: vine.date().optional(),
    status: vine.enum(['a_fazer', 'em_andamento', 'concluida']).optional(),
    favorite: vine.boolean().optional(),
  })
)