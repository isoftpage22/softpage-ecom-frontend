import {all} from "redux-saga/effects";
import apiSaga from './apiSaga';


export default function* rootSaga() {
    yield all([
        apiSaga()
    ]);
}