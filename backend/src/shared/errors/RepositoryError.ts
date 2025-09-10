import AppError, { AppErrorProps } from './AppError';

export default class RepositoryError extends AppError {
    constructor(props: Omit<AppErrorProps, 'statusCode'> & { statusCode?: number }) {
        super({
            ...props,
            statusCode: props.statusCode || 500
        });
        this.name = 'RepositoryError';
    }
}
