#!/usr/bin/env node
/* eslint-disable
 */
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { AstroStack } from '../lib/awscdk-stack'

const app = new cdk.App()
new AstroStack(app, 'Stack')
