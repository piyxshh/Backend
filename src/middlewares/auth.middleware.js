
//middleware for logout of user

import { ApiError } from "../utils/ApiError"
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken";
import {User} from "../models/user.models";

export const verifyJWT = asyncHandler(async(req, res,
    next) => {
        try {
            const token = req.cookies?.accessToken || req.header
            ("Authorization")?.replace("Bearer ", "")
    
            if (!token) {
                throw new ApiError(401, "Unathorized request")
            }
            
            const decodedToken = jwt.verify(token, processs.env.
                ACCESS_TOKEN_SECRET)
    
                await User.findById(decodedToken?._id).
                select("-password -refreshToken")
    
    
            if (!user){
    
                throw new ApiError(402, "Invalid Access Token")
            }
    
            req.user = user;
            next()
        } catch (error) {
            throw new ApiError(401, error?.message) ||
            "Inavlid access token"
        }
    })