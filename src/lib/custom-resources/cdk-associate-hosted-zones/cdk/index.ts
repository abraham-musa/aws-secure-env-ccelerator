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

import * as path from 'path';
import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';

const resourceType = 'Custom::AssociateHostedZones';

export interface AssociateHostedZonesProps {
  assumeRoleName: string;
  vpcAccountId: string;
  vpcName: string;
  vpcId: string;
  vpcRegion: string;
  hostedZoneAccountId: string;
  hostedZoneIds: string[];
  roleArn: string;
}

/**
 * Currently this module is not being used
 */

export type AssociateHostedZonesRuntimeProps = Omit<AssociateHostedZonesProps, 'roleArn'>;

/**
 * Custom resource that will create SSM Document.
 */
export class AssociateHostedZones extends cdk.Construct {
  private readonly resource: cdk.CustomResource;
  private role: iam.IRole;

  constructor(scope: cdk.Construct, id: string, props: AssociateHostedZonesProps) {
    super(scope, id);
    this.role = iam.Role.fromRoleArn(this, `${resourceType}Role`, props.roleArn);

    const runtimeProps: AssociateHostedZonesRuntimeProps = props;
    this.resource = new cdk.CustomResource(this, 'Resource', {
      resourceType,
      serviceToken: this.lambdaFunction.functionArn,
      properties: {
        ...runtimeProps,
      },
    });
  }

  private get lambdaFunction(): lambda.Function {
    const constructName = `${resourceType}Lambda`;
    const stack = cdk.Stack.of(this);
    const existing = stack.node.tryFindChild(constructName);
    if (existing) {
      return existing as lambda.Function;
    }

    const lambdaPath = require.resolve('@aws-accelerator/custom-resource-associate-hosted-zones-runtime');
    const lambdaDir = path.dirname(lambdaPath);

    return new lambda.Function(stack, constructName, {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset(lambdaDir),
      handler: 'index.handler',
      role: this.role,
      timeout: cdk.Duration.minutes(15),
    });
  }
}