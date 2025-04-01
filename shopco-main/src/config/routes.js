import { lazy } from 'react';
import HomePage from '../pages/Home';
import CategoryPage from '../pages/Category';
import ProductDetailPage from '../pages/Product/Detail';
import AuthPage from '../pages/Auth';
import QuizPage from '../pages/Quiz/QuizPage';
import { registerUser, loginUser } from '../controllers/userController';
import RoutineManager from '../pages/Manager/Routine';
import RoutineDetail from '../pages/SkincareRoutine/SkincareRoutinesNew/RoutineDetail';
import RoutineEdit from '../pages/Manager/RoutineEdit';
import CareDetail from '../pages/CareProcess/CareDetail';

// Lazy load các components
const Home = lazy(() => import('../pages/Home'));
const Category = lazy(() => import('../pages/Category'));
const ProductDetail = lazy(() => import('../pages/Product/Detail'));
const Auth = lazy(() => import('../pages/Auth'));
const Quiz = lazy(() => import('../pages/Quiz/QuizPage'));

const routes = [
  {
    path: '/',
    element: Home,
    protected: false
  },
  {
    path: '/category/:slug',
    element: Category,
    protected: false
  },
  {
    path: '/product/:id',
    element: ProductDetail,
    protected: false
  },
  {
    path: '/auth',
    element: Auth,
    protected: false
  },
  {
    path: '/quiz',
    element: Quiz,
    protected: false
  },
  {
    path: '/api/Users/login',
    method: 'post',
    handler: loginUser
  }
];

export const publicRoutes = [
  {
    path: '/',
    component: HomePage
  },
  {
    path: '/category',
    component: CategoryPage
  },
  {
    path: '/product/:id',
    component: ProductDetailPage
  },
  {
    path: '/auth',
    component: AuthPage
  },
  {
    path: '/quiz',
    component: QuizPage
  },
  {
    path: '/routine',
    component: RoutineManager
  },
  {
    path: '/Routine/:id',
    component: RoutineDetail
  },
  {
    path: '/Routine/Edit/:id',
    component: RoutineEdit
  },
  {
    path: '/care/:id',
    component: CareDetail
  },
  {
    path: '/care/type/:skinType',
    component: CareDetail
  }
];

export const privateRoutes = [
  // Add private routes here
];

export default routes; 