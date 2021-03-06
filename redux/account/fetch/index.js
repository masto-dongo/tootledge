//  ACCOUNT:FETCH
//  =============

//  Action types.
export const ACCOUNT_FETCH_REQUEST = 'ACCOUNT_FETCH_REQUEST';
export const ACCOUNT_FETCH_SUCCESS = 'ACCOUNT_FETCH_SUCCESS';
export const ACCOUNT_FETCH_FAILURE = 'ACCOUNT_FETCH_FAILURE';

//  Action creators.
const request = id => ({
  id,
  type: ACCOUNT_FETCH_REQUEST,
});
const success = account => ({
  account,
  type: ACCOUNT_FETCH_SUCCESS,
});
const failure = (id, error) => ({
  error,
  id,
  type: ACCOUNT_FETCH_FAILURE,
});

//  Request.
export default function fetchAccount (id, force, go, current, api) {

  //  If we already have the account data, we don't bother fetching it.
  if (!force && current().getIn(['account', id])) {
    return;
  }

  //  The request.
  go(request, id);
  api.get(
    `/api/v1/accounts/${id}`
  ).then(
    response => go(success, response.data)
  ).catch(
    error => go(failure, id, error)
  );
}
