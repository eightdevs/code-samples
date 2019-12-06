import { createStore, compose, applyMiddleware } from "redux";
import createSagaMiddleware from "redux-saga"
import rootReducer from "./reducers";
import rootSaga from './sagas'

const sagaMiddleware = createSagaMiddleware();

const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const enhancer = composeEnhancers(
  applyMiddleware(sagaMiddleware),
  // other store enhancers if any
);

const store = createStore(rootReducer, enhancer);

sagaMiddleware.run(rootSaga);

export default store;
