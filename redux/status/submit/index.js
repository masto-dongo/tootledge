//  COMPOSER:SUBMIT
//  ===============

//  Imported requests.
import { updateTimeline } from '../../timeline';

//  Constants.
import { VISIBILITY } from '../../../constants';

//  Action types.
export const COMPOSER_SUBMIT_REQUEST = 'COMPOSER_SUBMIT_REQUEST';
export const COMPOSER_SUBMIT_SUCCESS = 'COMPOSER_SUBMIT_SUCCESS';
export const COMPOSER_SUBMIT_FAILURE = 'COMPOSER_SUBMIT_FAILURE';

//  Action creators.
const request = (text, options) => ({
  options,
  text,
  type: COMPOSER_SUBMIT_REQUEST,
});
const success = status => ({
  status,
  type: COMPOSER_SUBMIT_SUCCESS,
});
const failure = (text, options, error) => ({
  error,
  options,
  text,
  type: COMPOSER_SUBMIT_FAILURE,
});

//  Request.
export default function submitStatus (text, options, onUpload, go, current, api) {

  //  If we have no text, we can't submit our composer.
  if (!text || !text.length) return;

  //  Here is the data we send.
  const data = {};
  let item;
  if (options) {
    if ((item = options.inReplyTo)) {
      data.in_reply_to_id = item;
    }
    if ((item = options.media)) {
      data.media_ids = item;
    }
    if (typeof (item = options.sensitive) !== 'undefined') {
      data.sensitive = item;
    }
    if ((item = options.spoiler)) {
      data.spoiler_text = item;
    }
    if ((item = ~~options.visibility) === options.visibility) {
      if (!(item & VISIBILITY.FEDERATED)) {
        text += ' 👁️';
      }
      data.privacy = VISIBILITY.stringify(item);
    }
  }
  data.status = text;
  const headers = options ? { 'Idempotency-Key': options.idempotency } : {};

  //  The request.
  go(request, text, options);
  if (onUpload) {
    onUpload({ completed: false });
  }
  api.post(
    '/api/v1/statuses', data, { headers }
  ).then(
    response => {
      go(success, response.data);
      if (onUpload) {
        onUpload({
          completed: true,
          withSuccess: true,
        });
      }

      //  After posting our status, we add it to our home timeline.
      go(updateTimeline, '/api/v1/home', response.data);

      //  We also add it to the public and local timelines if it is a
      //  public status.
      if (!response.data.in_reply_to_id && response.data.visibility === 'public') {
        go(updateTimeline, '/api/v1/public', response.data);
        go(updateTimeline, '/api/v1/public?local=true', response.data);
      }
    }
  ).catch(
    error => {
      go(failure, text, options, error);
      if (onUpload) {
        onUpload({
          completed: true,
          withSuccess: false,
        });
      }
    }
  );
}
