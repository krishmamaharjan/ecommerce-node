import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import {redis} from "../lib/redis.js"

export const signup = async (req,res) => {

const generateTokens = (userId) => {
    const accessToken = jwt.sign({userId}, process.env.ACCESS_TOKEN_SECRET,{
        expiresIn: "15m",
    });

    const refreshToken = jwt.sign({userId}, process.env.REFRESH_TOKEN_SECRET,{
        expiresIn: "7d",
    });

    return { accessToken, refreshToken};
}

const storeRefreshToken= async(userId,refreshToken) => {
    await redis.set(`refresh_token:${userId}`,refreshToken,"EX",7*24*60*60);  //7days
}

const setCookies = (res, accessToken, refreshToken) => {
    res.cookie("accessToken", accessToken, {
        httpOnly: true,     //prevent XSS attacks
        secure:process.env.NODE_ENV === "production;",
        sameSite:"strict",  //prevents CSRF attack, cross-site request forgery attack
        maxAge: 15*60*1000, //15minutes
    });
    res.cookie("refreshToken", accessToken, {
        httpOnly: true,     //prevent XSS attacks
        secure:process.env.NODE_ENV === "production;",
        sameSite:"strict",  //prevents CSRF attack, cross-site request forgery attack
        maxAge: 7*24*60*60*1000, //7 days
    });
};
    




    const {email,password, name} = req.body;
    try{

        const userExists = await User.findOne({email});
        
        
        if(userExists)
        {
            return res.status(400).json({message: "User already exists"});
        }
        const user = await User.create({name,email,password});

        // authentication 

        const {accessToken, refreshToken} = generateTokens(user._id);
        await storeRefreshToken(user._id,refreshToken);
        
        setCookies(res,accessToken, refreshToken);

        res.status(201).json({
            user: {
                _id: user._id,
                name:user.name,
                email:user.email,
                role:user.role,

            }, message: "User created successfully"
        });

        res.status(201).json({user, message : "User created Successfully"});
    }catch(error)
    {
        res.status(500).json({message: error.message});
    }
    
};

export const login = async (req,res) => {
    res.send("login route called");
};

export const logout= async (req,res) => {
    try{
        const refreshToken = req.cookies.refreshToken;

        if(refreshToken)
        {
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            await redis.del(`refresh_token: ${decoded.userId}`);
        }
        

        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        res.json({message: "Logged ot successfully"});
    }catch(error)
    {
        console.log("Error in logout controller", error.message);
        res.status(500).json({message: "Server error", error: error.message});
    }
};