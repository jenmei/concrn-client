import {
  select,
  put,
  call,
  fork,
  take,
  takeEvery,
  all,
} from "redux-saga/effects"
import ConcrnClient from "services/ConcrnClient"
import * as types from "actions/types"
import createWatchSaga from "lib/createWatchSaga"
import R from "ramda"

import { NavigationActions } from "react-navigation"

function* authVerify(action) {
  const { code } = action.payload
  const phone = yield select(state => R.path(["auth", "phone"], state))
  const response = yield call(ConcrnClient.device.verify, {
    phone,
    code,
  })
  const { jwt: token, refresh_token: refreshToken } = response
  ConcrnClient.configureAuthentication({ token })
  yield put({
    type: types.ONBOARDING_STORE,
    payload: {
      token,
      refreshToken,
    },
  })
  yield put(NavigationActions.navigate({ routeName: "map" }))
}

function* authRequest(action) {
  const { phone, deviceId, name } = action.payload
  yield put({
    type: types.ONBOARDING_STORE,
    payload: {
      phone,
      deviceId,
      name,
    },
  })
  const response = yield call(ConcrnClient.device.create, {
    phone,
  })
  yield put(NavigationActions.navigate({ routeName: "Verify" }))
}

function* authCheck() {
  try {
    const auth = yield select(R.path(["auth"]))
    if (auth.token) {
      ConcrnClient.configureAuthentication({ token: auth.token })
      try {
        identity = yield call(ConcrnClient.token.validate, {})
      } catch (e) {
        identity = yield call(ConcrnClient.token.refresh, {
          refresh_token: auth.refreshToken,
        })
        yield put({
          type: types.ONBOARDING_STORE,
          payload: {
            token: identity.token,
          },
        })
        console.log("new token received")
      }
      yield put(NavigationActions.navigate({ routeName: "map" }))
    } else {
      throw new Error("[auth] no token detected")
    }
  } catch (e) {
    console.warn(e)
    debugger
    // something went wrong with checking auth, assuming they are not logged in and directing to onboarding
    yield put(NavigationActions.navigate({ routeName: "Welcome" }))
  }
}

function* authCheckWatchSaga() {
  while (true) {
    yield take(types.AUTH_CHECK)
    yield* authCheck()
  }
}

function* authSagas() {
  yield all([
    fork(createWatchSaga(types.AUTH_REQUEST, authRequest)),
    fork(createWatchSaga(types.AUTH_VERIFY, authVerify)),
    fork(authCheckWatchSaga),
  ])
}

export default authSagas
