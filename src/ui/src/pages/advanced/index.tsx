/**
 *  Copyright 2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance
 *  with the License. A copy of the License is located at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  or in the 'license' file accompanying this file. This file is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES
 *  OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions
 *  and limitations under the License.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useObservable } from '@/components/accelerator-config-context';
import { DefaultAppLayout } from '@/pages/default/app-layout';
import Tools from './tools';
import Content from './content';
import Breadcrumbs from './breadcrumbs';

export default function AdvancedPage() {
  const state = useObservable();

  return (
    <DefaultAppLayout breadcrumbs={<Breadcrumbs />} tools={<Tools state={state} />}>
      <Content state={state} />
    </DefaultAppLayout>
  );
}
