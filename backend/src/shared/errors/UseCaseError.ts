import AppError, { AppErrorProps } from './AppError';

export default class UseCaseError extends AppError {
    constructor(props: Omit<AppErrorProps, 'statusCode'> & { statusCode?: number }) {
        super({
            ...props,
            statusCode: props.statusCode || 400
        });
        this.name = 'UseCaseError';
    }
}
