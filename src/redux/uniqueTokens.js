import { apiGetAccountUniqueTokens } from '../handlers/opensea-api.js';
import {
  getUniqueTokens,
  saveUniqueTokens,
  removeUniqueTokens,
} from '../handlers/commonStorage';

// -- Constants ------------------------------------------------------------- //
const UNIQUE_TOKENS_LOAD_UNIQUE_TOKENS_REQUEST =
  'uniqueTokens/UNIQUE_TOKENS_LOAD_UNIQUE_TOKENS_REQUEST';
const UNIQUE_TOKENS_LOAD_UNIQUE_TOKENS_SUCCESS =
  'uniqueTokens/UNIQUE_TOKENS_LOAD_UNIQUE_TOKENS_SUCCESS';
const UNIQUE_TOKENS_LOAD_UNIQUE_TOKENS_FAILURE =
  'uniqueTokens/UNIQUE_TOKENS_LOAD_UNIQUE_TOKENS_FAILURE';

const UNIQUE_TOKENS_GET_UNIQUE_TOKENS_REQUEST =
  'uniqueTokens/UNIQUE_TOKENS_GET_UNIQUE_TOKENS_REQUEST';
const UNIQUE_TOKENS_GET_UNIQUE_TOKENS_SUCCESS =
  'uniqueTokens/UNIQUE_TOKENS_GET_UNIQUE_TOKENS_SUCCESS';
const UNIQUE_TOKENS_GET_UNIQUE_TOKENS_FAILURE =
  'uniqueTokens/UNIQUE_TOKENS_GET_UNIQUE_TOKENS_FAILURE';

const UNIQUE_TOKENS_CLEAR_STATE = 'uniqueTokens/UNIQUE_TOKENS_CLEAR_STATE';

// -- Actions --------------------------------------------------------------- //
let getUniqueTokensInterval = null;

export const uniqueTokensLoadState = () => async (dispatch, getState) => {
  const { accountAddress, network } = getState().settings;
  dispatch({ type: UNIQUE_TOKENS_LOAD_UNIQUE_TOKENS_REQUEST });
  try {
    const cachedUniqueTokens = await getUniqueTokens(accountAddress, network);
    dispatch({
      type: UNIQUE_TOKENS_LOAD_UNIQUE_TOKENS_SUCCESS,
      payload: cachedUniqueTokens,
    });
  } catch (error) {
    dispatch({ type: UNIQUE_TOKENS_LOAD_UNIQUE_TOKENS_FAILURE });
  }
};

export const uniqueTokensClearState = () => (dispatch, getState) => {
  const { accountAddress, network } = getState().settings;
  removeUniqueTokens(accountAddress, network);
  clearInterval(getUniqueTokensInterval);
  dispatch({ type: UNIQUE_TOKENS_CLEAR_STATE });
};

export const uniqueTokensRefreshState = () => (dispatch, getState) => new Promise((resolve, reject) => {
  dispatch({ type: UNIQUE_TOKENS_GET_UNIQUE_TOKENS_REQUEST });
  const { accountAddress, network } = getState().settings;
  const fetchUniqueTokens = () => new Promise((resolve, reject) => {
    apiGetAccountUniqueTokens(accountAddress)
      .then(uniqueTokens => {
        saveUniqueTokens(accountAddress, uniqueTokens, network);
        dispatch({
          type: UNIQUE_TOKENS_GET_UNIQUE_TOKENS_SUCCESS,
          payload: uniqueTokens,
        });
        resolve(true);
      }).catch(error => {
        dispatch({ type: UNIQUE_TOKENS_GET_UNIQUE_TOKENS_FAILURE });
        reject(error);
      });
  });
  fetchUniqueTokens().then(() => {
    clearInterval(getUniqueTokensInterval);
    getUniqueTokensInterval = setInterval(fetchUniqueTokens, 15000); // 15 secs
    resolve(true);
  }).catch(error => {
    clearInterval(getUniqueTokensInterval);
    getUniqueTokensInterval = setInterval(fetchUniqueTokens, 15000); // 15 secs
    reject(error);
  });
});


// -- Reducer --------------------------------------------------------------- //
export const INITIAL_UNIQUE_TOKENS_STATE = {
  fetchingUniqueTokens: false,
  loadingUniqueTokens: false,
  uniqueTokens: [],
};

export default (state = INITIAL_UNIQUE_TOKENS_STATE, action) => {
  switch (action.type) {
    case UNIQUE_TOKENS_LOAD_UNIQUE_TOKENS_REQUEST:
      return {
        ...state,
        loadingUniqueTokens: true,
      };
    case UNIQUE_TOKENS_LOAD_UNIQUE_TOKENS_SUCCESS:
      return {
        ...state,
        loadingUniqueTokens: false,
        uniqueTokens: action.payload,
      };
    case UNIQUE_TOKENS_LOAD_UNIQUE_TOKENS_FAILURE:
      return {
        ...state,
        loadingUniqueTokens: false
      };
    case UNIQUE_TOKENS_GET_UNIQUE_TOKENS_REQUEST:
      return {
        ...state,
        fetchingUniqueTokens: true,
      };
    case UNIQUE_TOKENS_GET_UNIQUE_TOKENS_SUCCESS:
      return {
        ...state,
        fetchingUniqueTokens: false,
        uniqueTokens: action.payload,
      };
    case UNIQUE_TOKENS_GET_UNIQUE_TOKENS_FAILURE:
      return {
        ...state,
        fetchingUniqueTokens: false
      };
    case UNIQUE_TOKENS_CLEAR_STATE:
      return {
        ...state,
        ...INITIAL_UNIQUE_TOKENS_STATE,
      };
    default:
      return state;
  }
};
