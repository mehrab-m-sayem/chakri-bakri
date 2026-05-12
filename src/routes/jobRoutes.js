import express from 'express'
import prisma from '../prismaClient.js'


const router = express.Router()

// get user's jobs
router.get('/', async (req, res) => {
    try {
        const jobs = await prisma.jobs.findMany({
            where: {
                userId: req.userId
            },
            orderBy: {
                DateApplied: 'desc'
            }
        });
        res.json(jobs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch jobs" });
    }
})

// add applied job
router.post('/addJob', async (req, res) => {
    try {

        const { title, companyName, DateApplied, salary, description, Url, Status } = req.body;

        const newJob = await prisma.jobs.create({
            data: {
                title,
                companyName,
                DateApplied,
                salary,
                description,
                Url,
                Status,
                userId: req.userId
            }
        });


        res.json(newJob);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to add job" });
    }
})

// update applied job
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params
        const { title, companyName, DateApplied, salary, description, Url, Status } = req.body

        // check if job exists
        const existingJob = await prisma.jobs.findUnique({
            where: {
                id: parseInt(id)
            }
        });

        if (!existingJob) {
            return res.status(404).json({ error: "Job not found" });
        }

        if (existingJob.userId !== req.userId) {
            return res.status(403).json({ error: "unauthorized" })
        }

        const updatedJob = await prisma.jobs.update({
            where: {
                id: parseInt(id),
                userId: req.userId

            },
            data: {
                title,
                companyName,
                DateApplied,
                salary,
                description,
                Url,
                Status
            }
        })
        res.json(updatedJob)
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update job" });
    }
})



// delete job
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        // Use deleteMany to filter by both the job id AND the userId
        // to ensure a user can only delete their own jobs. 
        // standard delete() only allows unique fields in 'where'
        const deleted = await prisma.jobs.deleteMany({
            where: {
                id: parseInt(id),
                userId: userId
            }
        });

        if (deleted.count === 0) {
            return res.status(404).send({ message: "Job not found or unauthorized" });
        }

        res.send({ message: "Successfully deleted" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete job" });
    }
})


export default router