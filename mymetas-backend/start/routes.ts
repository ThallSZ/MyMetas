import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
const UsersController = () => import('#controllers/users_controller')
const SessionController = () => import('#controllers/session_controller')
const MetasController = () => import('#controllers/metas_controller')
const StepsController = () => import('#controllers/steps_controller')


router.post('/user', [UsersController, 'store'])
router.post('/session', [SessionController, 'store'])
router
  .group(() => {
    router.get('/user', [UsersController, 'show'])
    router.put('/user', [UsersController, 'update'])
    router.delete('/user', [UsersController, 'destroy'])

    router.resource('metas', MetasController).apiOnly()
    router.resource('metas.steps', StepsController).apiOnly().except(['index', 'show'])
  })
  .use(middleware.auth())