import { Construct } from 'constructs'
import {
    Stack,
    StackProps,
    Duration,
    aws_s3,
    aws_cloudfront,
    aws_cloudfront_origins,
    aws_iam,
    RemovalPolicy,
} from 'aws-cdk-lib'

export class AstroStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props)

        const env: string = this.node.tryGetContext('env')
        const bucketName: string = this.node.tryGetContext(env).s3.bucketName
        const accountId: string = this.node.tryGetContext(env).aws.accountId

        const astroBucket = new aws_s3.Bucket(this, bucketName, {
            accessControl: aws_s3.BucketAccessControl.PRIVATE,
            removalPolicy: RemovalPolicy.DESTROY,
        })

        // AWS OAI https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html
        const OAI = new aws_cloudfront.OriginAccessIdentity(
            this,
            'OriginAccessIdentity',
            {
                comment: `${bucketName} Origin Access Identity}`,
            }
        )

        const astroBucketPolicyStatement = new aws_iam.PolicyStatement({
            effect: aws_iam.Effect.ALLOW,
            actions: ['s3:GetObject'],
            principals: [
                new aws_iam.CanonicalUserPrincipal(
                    OAI.cloudFrontOriginAccessIdentityS3CanonicalUserId
                ),
            ],
            resources: [`${astroBucket.bucketArn}/*`],
        })

        astroBucket.addToResourcePolicy(astroBucketPolicyStatement)

        const addMultiPageIndexFunction = new aws_cloudfront.Function(
            this,
            'AddMultiPageIndex',
            {
                functionName: `add-multi-page-index`,
                code: aws_cloudfront.FunctionCode.fromFile({
                    filePath: 'lambda/cloudFrontFunctions.js',
                }),
            }
        )

        const distribution = new aws_cloudfront.Distribution(
            this,
            'distribution',
            {
                comment: `${bucketName}-distribution`,
                enableIpv6: true,
                httpVersion: aws_cloudfront.HttpVersion.HTTP2,
                defaultRootObject: 'index.html',
                defaultBehavior: {
                    allowedMethods:
                        aws_cloudfront.AllowedMethods.ALLOW_GET_HEAD,
                    cachedMethods: aws_cloudfront.CachedMethods.CACHE_GET_HEAD,
                    cachePolicy: aws_cloudfront.CachePolicy.CACHING_OPTIMIZED,
                    viewerProtocolPolicy:
                        aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                    origin: new aws_cloudfront_origins.S3Origin(astroBucket, {
                        originAccessIdentity: OAI,
                    }),
                    functionAssociations: [
                        {
                            function: addMultiPageIndexFunction,
                            eventType:
                                aws_cloudfront.FunctionEventType.VIEWER_REQUEST,
                        },
                    ],
                },
                priceClass: aws_cloudfront.PriceClass.PRICE_CLASS_200,
            }
        )

        // Github Actions用のロールとポリシーの作成
        const provider = new aws_iam.OpenIdConnectProvider(this, 'Provider', {
            url: 'https://token.actions.githubusercontent.com',
            // AWSに登録されているGithubのOIDCプロバイダーのthumbprint
            thumbprints: [
                'a031c46782e6e6c662c2c87c76da9aa62ccabd8e',
                '6938fd4d98bab03faadb97b34396831e3780aea1',
            ],
            clientIds: ['sts.amazonaws.com'],
        })

        const role = new aws_iam.Role(this, 'Role', {
            roleName: 'GitHubActionsDeployRole',
            maxSessionDuration: Duration.hours(2),
            assumedBy: new aws_iam.WebIdentityPrincipal(
                provider.openIdConnectProviderArn,
                {
                    StringEquals: {
                        'token.actions.githubusercontent.com:aud':
                            'sts.amazonaws.com',
                    },
                    StringLike: {
                        'token.actions.githubusercontent.com:sub':
                            'repo:Tak-Irie/pnpm-mono:*',
                    },
                }
            ),
        })

        // https://docs.astro.build/ja/guides/deploy/aws/#continuous-deployment-with-github-actions
        role.addToPolicy(
            new aws_iam.PolicyStatement({
                effect: aws_iam.Effect.ALLOW,
                actions: [
                    's3:PutObject',
                    's3:ListBucket',
                    'cloudfront:CreateInvalidation',
                ],
                resources: [
                    `arn:aws:cloudfront::${accountId}:distribution/${distribution.distributionId}`,
                    `arn:aws:s3:::${bucketName}/*`,
                    `arn:aws:s3:::${bucketName}`,
                ],
            })
        )
    }
}
