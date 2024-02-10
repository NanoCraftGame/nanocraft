import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as acm from 'aws-cdk-lib/aws-certificatemanager'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins'

export class NanoCraftStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props)
        const domainName = 'nanocraft.rblab.net'

        // Create an S3 bucket for the static site
        const siteBucket = new s3.Bucket(this, 'SiteBucket', {
            bucketName: `${domainName}-wtf-123`, // Must be globally unique
            websiteIndexDocument: 'index.html',
            // publicReadAccess: true,
            removalPolicy: cdk.RemovalPolicy.DESTROY, // For dev only; be cautious with production environments
        })

        const certificate = new acm.Certificate(this, 'Certificate', {
            domainName: domainName,
            validation: acm.CertificateValidation.fromDns(), // Automates DNS validation if you're using Route 53
        })

        const oai = new cloudfront.OriginAccessIdentity(this, 'OAI')
        siteBucket.grantRead(oai)

        // Create a CloudFront distribution pointing to the S3 bucket
        const distribution = new cloudfront.Distribution(
            this,
            'SiteDistribution',
            {
                defaultBehavior: {
                    origin: new origins.S3Origin(siteBucket, {
                        originAccessIdentity: oai,
                    }),
                    viewerProtocolPolicy:
                        cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                },
                domainNames: ['new-app.mydomain.com'],
                certificate: certificate,
            },
        )

        // Output the CloudFront distribution domain name
        new cdk.CfnOutput(this, 'DistributionDomainName', {
            value: distribution.distributionDomainName,
        })
    }
}
