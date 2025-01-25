import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../images/artifact.png';

function SignUpPage() {
    const handleSignUpClick = () => {
        const signupUrl = "https://dev.relicdao.com/offer-landing?offer_id=eclipse-relicdao&utm_term=test_test_test_test";
        window.location.href = signupUrl;
        console.log("trying to connect");
    };

    return (
        <div className="flex flex-col items-center justify-center gap-2 min-h-screen bg-[#191d21] text-white font-sans">
            <div className="flex flex-col items-center justify-center w-full h-full">
                <img src={logo} alt="Artifact logo" className="w-1/2 mb-24 mt-8" />
                <h1 className="text-2xl mb-24 text-center font-extrabold">RelicDAO</h1>
                <div className="flex flex-col items-center justify-center mb-8">
                    <button 
                        className="bg-purple-600 text-white py-3 px-24 text-lg rounded-xl mb-6 hover:bg-purple-700 transition-colors duration-300"
                        onClick={handleSignUpClick}
                    >
                        Sign up
                    </button>
                    <p className="text-sm mb-4">
                        Already have an account?{' '}
                        <Link to="/login" className="text-purple-400 hover:text-purple-300">
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default SignUpPage;