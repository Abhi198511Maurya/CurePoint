import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
    return (
        <div className='md:mx-10'>
            <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>
                {/* ----------------------- Left section ---------------------- */}
                <div>
                    <img src={assets.logo} alt="" />
                    <p className='w-full md:w-2/3 text-gray-600 leading-6'>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quos, minus quo sed placeat, tempore, vel sapiente voluptate repellat ipsam doloremque laudantium odio quibusdam beatae dolorem exercitationem sequi reiciendis excepturi dicta.</p>
                </div>
                {/* ----------------------- Center section ---------------------- */}
                <div>
                    <p className='text-xl font-medium mb-5'>Company</p>
                    <ul className='flex flex-col gap-2 text-gray-600'>
                        <li>Home</li>
                        <li>About us</li>
                        <li>Contact us</li>
                        <li>Privacy Policy</li>
                    </ul>
                </div>
                {/* ----------------------- Right section ---------------------- */}
                <div>
                    <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
                    <ul className='flex flex-col gap-2 text-gray-600'>
                        <li>+91-123-123-4567</li>
                        <li>abc123@gmail.com</li>
                    </ul>
                </div>
            </div>
            <div>
                {/* ----------------- Copy Right Text -------------- */}
                <div>
                    <hr />
                    <p className='py-5 text-sm text-center'>Copyright 2025@ CurePoint - All Right Reserved.</p>
                </div>
            </div>
        </div>
    )
}

export default Footer