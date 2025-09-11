import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { injectable } from 'inversify';
import Pino from '@util/Pino';

export interface CertificateValidationResult {
    isValid: boolean;
    error?: string;
    certificateInfo?: {
        subject: string;
        issuer: string;
        validFrom: Date;
        validTo: Date;
        fingerprint: string;
    };
}

@injectable()
export default class CertificateValidationService {
    private readonly certificatePath: string;
    private cachedCertificates: crypto.X509Certificate[] | null = null;

    constructor() {
        this.certificatePath = path.join(__dirname, '../../../certs/certificate-chain-prod.crt');
    }

    /**
     * Load and parse the certificate chain from file
     */
    private loadCertificates(): crypto.X509Certificate[] {
        if (this.cachedCertificates) {
            return this.cachedCertificates;
        }

        try {
            const certData = fs.readFileSync(this.certificatePath, 'utf8');
            const certificates: crypto.X509Certificate[] = [];
            
            // Split the certificate chain into individual certificates
            const certBlocks = certData.match(/-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/g);
            
            if (!certBlocks || certBlocks.length === 0) {
                throw new Error('No valid certificates found in certificate file');
            }

            for (const certBlock of certBlocks) {
                try {
                    const cert = new crypto.X509Certificate(certBlock);
                    certificates.push(cert);
                } catch (error) {
                    Pino.warn(`[CertificateValidationService] Failed to parse certificate block: ${error}`);
                }
            }

            this.cachedCertificates = certificates;
            return certificates;
        } catch (error) {
            Pino.error(`[CertificateValidationService] Failed to load certificates: ${error}`);
            throw new Error(`Failed to load certificate file: ${error}`);
        }
    }

    /**
     * Validate a client certificate against the trusted certificate chain
     */
    public validateClientCertificate(clientCertPem: string): CertificateValidationResult {
        try {
            const clientCert = new crypto.X509Certificate(clientCertPem);
            const trustedCerts = this.loadCertificates();

            // Check if the client certificate is in our trusted chain
            const isDirectMatch = trustedCerts.some(trustedCert => 
                trustedCert.fingerprint === clientCert.fingerprint
            );

            if (isDirectMatch) {
                return {
                    isValid: true,
                    certificateInfo: this.extractCertificateInfo(clientCert)
                };
            }

            // Check if the client certificate is signed by any of our trusted certificates
            for (const trustedCert of trustedCerts) {
                try {
                    const isVerified = clientCert.verify(trustedCert.publicKey);
                    if (isVerified) {
                        return {
                            isValid: true,
                            certificateInfo: this.extractCertificateInfo(clientCert)
                        };
                    }
                } catch (verifyError) {
                    // Continue checking other certificates
                    continue;
                }
            }

            return {
                isValid: false,
                error: 'Certificate not found in trusted chain and not signed by trusted CA'
            };

        } catch (error) {
            Pino.error(`[CertificateValidationService] Certificate validation error: ${error}`);
            return {
                isValid: false,
                error: `Certificate validation failed: ${error}`
            };
        }
    }

    /**
     * Validate certificate from request headers (typically x-ssl-cert)
     */
    public validateFromHeaders(headers: Record<string, any>): CertificateValidationResult {
        const certHeader = headers['x-ssl-cert'] || headers['x-client-cert'] || headers['ssl-client-cert'];
        
        if (!certHeader) {
            return {
                isValid: false,
                error: 'No client certificate found in request headers'
            };
        }

        // Decode URL-encoded certificate if necessary
        let certPem = decodeURIComponent(certHeader);
        
        // Ensure proper PEM format
        if (!certPem.includes('-----BEGIN CERTIFICATE-----')) {
            certPem = `-----BEGIN CERTIFICATE-----\n${certPem}\n-----END CERTIFICATE-----`;
        }

        return this.validateClientCertificate(certPem);
    }

    /**
     * Extract certificate information for logging/debugging
     */
    private extractCertificateInfo(cert: crypto.X509Certificate) {
        return {
            subject: cert.subject,
            issuer: cert.issuer,
            validFrom: new Date(cert.validFrom),
            validTo: new Date(cert.validTo),
            fingerprint: cert.fingerprint
        };
    }

    /**
     * Check if the certificate chain is valid and not expired
     */
    public validateCertificateChain(): CertificateValidationResult {
        try {
            const certificates = this.loadCertificates();
            const now = new Date();

            for (const cert of certificates) {
                const validFrom = new Date(cert.validFrom);
                const validTo = new Date(cert.validTo);

                if (now < validFrom || now > validTo) {
                    return {
                        isValid: false,
                        error: `Certificate expired or not yet valid. Valid from: ${validFrom}, Valid to: ${validTo}`
                    };
                }
            }

            return {
                isValid: true,
                certificateInfo: this.extractCertificateInfo(certificates[0]) // Return info for the first cert
            };

        } catch (error) {
            return {
                isValid: false,
                error: `Certificate chain validation failed: ${error}`
            };
        }
    }

    /**
     * Clear cached certificates (useful for testing or certificate updates)
     */
    public clearCache(): void {
        this.cachedCertificates = null;
    }
}
