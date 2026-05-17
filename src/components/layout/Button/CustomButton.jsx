import React from 'react';
import { classNames } from '../../../utilities/classNames';

const CustomButton = (props) => {
    const {children, type = 'button', className } = props;
    return (
        <button
            {...props}
            type={type}
            className={classNames(
                `py-2 px-6 mr-2 text-sm font-medium text-white bg-blue-500 rounded border border-gray-200 focus:z-10 inline-flex items-center disabled:cursor-not-allowed disabled:opacity-50`,
                className
            )}
        >
            {children}
        </button>
    );
};

export default CustomButton;
