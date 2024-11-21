import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../images/artifact.png'

function SignUpPage() {
    return (
        <div className="flex flex-col items-center justify-center gap-2 min-h-screen bg-[#191d21] text-white font-sans">
            <div className="flex flex-col items-center justify-center gap-2">
                <img src={logo} alt="Artifact logo" className="w-1/2 mb-8" />
                <h1 className="text-2xl mb-8">Artifact sign up</h1>
            </div>
            <div className="flex flex-col items-center justify-center mt-12 -mb-16">
                <button className="bg-purple-600 text-white py-3 px-24 text-lg rounded-full mb-6 hover:bg-purple-700 transition-colors duration-300">
                    Sign up
                </button>
                <p className="text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-purple-400 hover:text-purple-300">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default SignUpPage;