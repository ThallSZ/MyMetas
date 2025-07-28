import vine from '@vinejs/vine'

export const createStepValidator = vine.compile(
  vine.object({
    description: vine.string().trim(),
  })
)

export const updateStepValidator = vine.compile(
  vine.object({
    description: vine.string().trim().optional(),
    done: vine.boolean().optional(),
  })
)