import aboutRoutes from './about'
import errorRoutes from './error'
import homeRoutes from './home'

export const routes: RouteRecordRaw[] = [...homeRoutes, ...aboutRoutes, ...errorRoutes]
