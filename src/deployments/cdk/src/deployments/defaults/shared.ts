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

import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import * as kms from '@aws-cdk/aws-kms';
import { Bucket } from '@aws-accelerator/cdk-constructs/src/s3';
import { createEncryptionKeyName } from '@aws-accelerator/cdk-accelerator/src/core/accelerator-name-generator';
import { AccountStack } from '../../common/account-stacks';
import { overrideLogicalId } from '../../utils/cdk';
import { Organizations } from '@aws-accelerator/custom-resource-organization';

export interface KmsDetails {
  encryptionKey: kms.Key;
  alias: string;
}

export function createDefaultS3Key(props: { accountStack: AccountStack; prefix: string }): KmsDetails {
  const { accountStack } = props;
  const organization = new Organizations(accountStack, 'Organization');
  const keyAlias = createEncryptionKeyName('Bucket-Key');
  const encryptionKey = new kms.Key(accountStack, 'DefaultKey', {
    alias: `alias/${keyAlias}`,
    description: `Default bucket encryption key`,
    enableKeyRotation: true,
  });
  encryptionKey.addToResourcePolicy(
    new iam.PolicyStatement({
      sid: 'Enable IAM User Permissions',
      principals: [new iam.AccountRootPrincipal()],
      actions: ['kms:*'],
      resources: ['*'],
    }),
  );
  encryptionKey.addToResourcePolicy(
    new iam.PolicyStatement({
      sid: 'Allow AWS services to use the encryption key',
      actions: ['kms:Encrypt', 'kms:Decrypt', 'kms:ReEncrypt*', 'kms:GenerateDataKey*', 'kms:DescribeKey'],
      principals: [
        new iam.ServicePrincipal('sns.amazonaws.com'),
        new iam.ServicePrincipal('cloudwatch.amazonaws.com'),
        new iam.ServicePrincipal('lambda.amazonaws.com'),
        // For macie usage in security account
        new iam.ServicePrincipal('macie.amazonaws.com'),
        // Kinesis for usage in the log account
        new iam.ServicePrincipal('kinesis.amazonaws.com'),
      ],
      resources: ['*'],
    }),
  );
  encryptionKey.addToResourcePolicy(
    new iam.PolicyStatement({
      sid: 'Allow Accelerator Role to use the encryption key',
      actions: ['kms:Encrypt', 'kms:Decrypt', 'kms:ReEncrypt*', 'kms:GenerateDataKey*', 'kms:DescribeKey'],
      principals: [new iam.AnyPrincipal()],
      resources: ['*'],
      conditions: {
        StringEquals: {
          'aws:PrincipalOrgID': organization.organizationId,
        },
        StringLike: {
          'aws:PrincipalArn': `arn:aws:iam::*:role/${props.prefix}*`,
        },
      },
    }),
  );

  return {
    encryptionKey,
    alias: keyAlias,
  };
}

/**
 * Creates a bucket in the account with given accountKey.
 */
export function createDefaultS3Bucket(props: {
  accountStack: AccountStack;
  encryptionKey: kms.Key;
  logRetention: number;
  versioned?: boolean;
}): Bucket {
  const { accountStack, encryptionKey, logRetention, versioned } = props;

  // Generate fixed bucket name so we can do initialize cross-account bucket replication
  const bucket = new Bucket(accountStack, 'DefaultBucket', {
    encryptionKey,
    expirationInDays: logRetention,
    removalPolicy: cdk.RemovalPolicy.RETAIN,
    versioned,
  });

  // Let the bucket name be generated by CloudFormation
  // The generated bucket name is based on the stack name + logical ID + random suffix
  overrideLogicalId(bucket, accountStack.region);

  bucket.encryptionKey?.addToResourcePolicy(
    new iam.PolicyStatement({
      sid: 'Allow AWS services to use the encryption key',
      actions: ['kms:Encrypt', 'kms:Decrypt', 'kms:ReEncrypt*', 'kms:GenerateDataKey*', 'kms:DescribeKey'],
      principals: [
        // TODO Isn't there a better way to grant to all AWS services through a condition?
        new iam.ServicePrincipal('ds.amazonaws.com'),
        new iam.ServicePrincipal('delivery.logs.amazonaws.com'),
      ],
      resources: ['*'],
    }),
  );

  return bucket;
}
