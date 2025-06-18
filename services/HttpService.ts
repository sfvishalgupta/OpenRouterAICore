import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { PostRequest } from '../types';

export const MakePostCall = async ({ url, headers, body, responseType }: PostRequest): Promise<AxiosResponse> => {
  const config: AxiosRequestConfig = {
    responseType: responseType as AxiosRequestConfig['responseType'],
    headers,
  };
  return await axios.post(url, body, config);
};
