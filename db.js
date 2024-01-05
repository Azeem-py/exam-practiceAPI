//making sure only one prisma client is created

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

module.exports = { prisma }
