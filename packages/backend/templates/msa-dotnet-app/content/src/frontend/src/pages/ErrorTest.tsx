import React, { useState } from 'react';
import { Button } from 'primereact/button';

const ErrorTest: React.FC = () => {
    const [shouldError, setShouldError] = useState(false);

    if (shouldError) {
        throw new Error('This is a test error!');
    }

    return (
        <div className="p-4">
            <div className="card">
                <h2>Error Boundary Test</h2>
                <p className="mb-4">Click the button below to test error boundary</p>
                <Button 
                    label="Throw Error" 
                    icon="pi pi-exclamation-triangle"
                    severity="danger"
                    onClick={() => setShouldError(true)}
                />
            </div>
        </div>
    );
};

export default ErrorTest; 