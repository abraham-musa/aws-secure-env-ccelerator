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

import { HashRouter, Route, Switch } from 'react-router-dom';
import { AwsCredentialsProvider } from '@/components/aws-credentials-context';
import { ObservableProvider, SyncObservable } from '@/components/accelerator-config-context';
import { ScrollToTop } from '@/components/scroll-to-top';
import { UiProvider } from '@/components/ui-context';
import { I18nProvider } from './components/i18n-context';
import HomePage from '@/pages/home';
import AdvancedPage from '@/pages/advanced';
import EditorPage from '@/pages/editor';
import WizardsPage from '@/pages/wizards';

function App() {
  return (
    <I18nProvider>
      <AwsCredentialsProvider>
        <ObservableProvider>
          <SyncObservable />
          <HashRouter>
            <UiProvider>
              <ScrollToTop />
              <Switch>
                <Route path="/advanced/:path?">
                  <AdvancedPage />
                </Route>
                <Route path="/editor">
                  <EditorPage />
                </Route>
                <Route path="/wizard">
                  <WizardsPage />
                </Route>
                <Route>
                  <HomePage />
                </Route>
              </Switch>
            </UiProvider>
          </HashRouter>
        </ObservableProvider>
      </AwsCredentialsProvider>
    </I18nProvider>
  );
}

export default App;
