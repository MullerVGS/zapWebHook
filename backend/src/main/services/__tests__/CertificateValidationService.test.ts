import CertificateValidationService from '../CertificateValidationService';
import * as fs from 'fs';
import * as path from 'path';

describe('CertificateValidationService', () => {
    let certificateValidationService: CertificateValidationService;

    beforeEach(() => {
        certificateValidationService = new CertificateValidationService();
    });

    afterEach(() => {
        // Clear cache after each test
        certificateValidationService.clearCache();
    });

    describe('validateCertificateChain', () => {
        it('should validate the certificate chain successfully', () => {
            const result = certificateValidationService.validateCertificateChain();
            
            expect(result.isValid).toBe(true);
            expect(result.certificateInfo).toBeDefined();
            expect(result.certificateInfo?.subject).toContain('webhook.efipay.com.br');
        });
    });

    describe('validateFromHeaders', () => {
        it('should return invalid when no certificate header is present', () => {
            const headers = {
                'content-type': 'application/json'
            };

            const result = certificateValidationService.validateFromHeaders(headers);
            
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('No client certificate found');
        });

        it('should validate certificate from x-ssl-cert header', () => {
            // Read the first certificate from the chain for testing
            const certPath = path.join(__dirname, '../../../../certs/certificate-chain-prod.crt');
            const certData = fs.readFileSync(certPath, 'utf8');
            const firstCert = certData.match(/-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/)?.[0];

            if (!firstCert) {
                throw new Error('Could not extract certificate for testing');
            }

            const headers = {
                'x-ssl-cert': encodeURIComponent(firstCert)
            };

            const result = certificateValidationService.validateFromHeaders(headers);
            
            expect(result.isValid).toBe(true);
            expect(result.certificateInfo).toBeDefined();
        });

        it('should handle malformed certificate gracefully', () => {
            const headers = {
                'x-ssl-cert': 'invalid-certificate-data'
            };

            const result = certificateValidationService.validateFromHeaders(headers);
            
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('Certificate validation failed');
        });
    });

    describe('validateClientCertificate', () => {
        it('should validate a certificate from the trusted chain', () => {
            // Read the first certificate from the chain for testing
            const certPath = path.join(__dirname, '../../../../certs/certificate-chain-prod.crt');
            const certData = fs.readFileSync(certPath, 'utf8');
            const firstCert = certData.match(/-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/)?.[0];

            if (!firstCert) {
                throw new Error('Could not extract certificate for testing');
            }

            const result = certificateValidationService.validateClientCertificate(firstCert);
            
            expect(result.isValid).toBe(true);
            expect(result.certificateInfo).toBeDefined();
            expect(result.certificateInfo?.subject).toContain('webhook.efipay.com.br');
        });

        it('should reject invalid certificate format', () => {
            const invalidCert = 'not-a-certificate';

            const result = certificateValidationService.validateClientCertificate(invalidCert);
            
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('Certificate validation failed');
        });
    });

    describe('clearCache', () => {
        it('should clear the certificate cache', () => {
            // First call to load certificates
            certificateValidationService.validateCertificateChain();
            
            // Clear cache
            certificateValidationService.clearCache();
            
            // This should work without issues (cache will be reloaded)
            const result = certificateValidationService.validateCertificateChain();
            expect(result.isValid).toBe(true);
        });
    });
});
