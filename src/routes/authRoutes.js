import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../prismaClient.js'

const router = express.Router()

// new user registration
router.post('/register', async(req,res) =>{
    const {username, password, email} = req.body
    const hashedPassword = await bcrypt.hashSync(password, 8)

    try{
        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword
            }
        })
        const token = jwt.sign({id: user.id}, process.env.JWT_SECRET, {expiresIn: '1h'})
        res.json({ token })
    }
    catch (err) {
        console.log(err.message)
        res.sendStatus(503)
    }
})

router.post('/login', async (req , res) => {
        const {username, password} = req.body

        try{
            const user = await prisma.user.findUnique({
                where: {
                    username: username
                }
            })
        // if no user exist with this username
        if (!user) {return res.status(404).send({message: "user not found"})}

        const passwordIsValid = await bcrypt.compare(password, user.password)
        //if password not match
        if(!passwordIsValid) {return res.status(401).send({message: "password not valid"})}
            console.log(user)
        
        // if password and username good to go
        const token = jwt.sign({id: user.id}, process.env.JWT_SECRET, {expiresIn: "1h"})
        return res.json({token})
        }
        catch(err){
            console.log(err.message)
            res.sendStatus(503)
        }
        


}
)


export default router