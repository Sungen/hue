// Licensed to Cloudera, Inc. under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  Cloudera, Inc. licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { ExecutionStatus } from './execution/executable';
import { CancellablePromise } from 'api/cancellablePromise';
import { get, post } from 'api/utils';

const FORMAT_SQL_API_URL = '/notebook/api/format';
const HISTORY_API_URL = '/notebook/api/get_history';

interface FormatSqlApiResponse {
  formatted_statements?: string;
  status: number;
}

export const formatSql = async (options: {
  statements: string;
  silenceErrors?: boolean;
}): Promise<string> => {
  try {
    const params = new URLSearchParams();
    params.append('statements', options.statements);
    const response = await post<FormatSqlApiResponse>(FORMAT_SQL_API_URL, params);

    if (response.status !== -1 && response.formatted_statements) {
      return response.formatted_statements;
    }
  } catch (err) {
    if (!options.silenceErrors) {
      throw err;
    }
  }
  return options.statements;
};

export interface FetchHistoryOptions {
  type: string;
  page?: number;
  limit?: number;
  docFilter?: string;
  isNotificationManager?: boolean;
}

export interface FetchHistoryResponse {
  count: number;
  history: {
    absoluteUrl: string;
    data: {
      lastExecuted: number;
      parentSavedQueryUuid: string;
      statement: string;
      status: ExecutionStatus;
    };
    id: number;
    name: string;
    type: string;
    uuid: string;
  }[];
  message: string;
  status: number;
}

export const fetchHistory = (
  options: FetchHistoryOptions
): CancellablePromise<FetchHistoryResponse> => {
  return get<FetchHistoryResponse>(HISTORY_API_URL, {
    doc_type: options.type,
    limit: options.limit || 50,
    page: options.page || 1,
    doc_text: options.docFilter,
    is_notification_manager: options.isNotificationManager
  });
};
