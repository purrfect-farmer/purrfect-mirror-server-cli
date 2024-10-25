#!/usr/bin/env node

const chalk = require("chalk");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { networkInterfaces } = require("os");

function createSyncServer() {
  return new Promise((resolve, reject) => {
    const PORT = 7777;
    const server = createServer();
    const io = new Server(server, {
      cors: {
        origin: "*",
      },
    });

    /** Add to Room */
    io.on("connection", (socket) => {
      socket.join("receivers");

      socket.on("message", (arg) => {
        socket.to("receivers").emit("command", arg);
      });
    });

    /** Start Server */
    server.on("error", reject).listen(PORT, (error) => {
      if (error) return reject(error);

      const nets = networkInterfaces();
      const addresses = [];

      for (const interfaces of Object.values(nets)) {
        for (const net of interfaces) {
          const familyV4Value = typeof net.family === "string" ? "IPv4" : 4;
          if (net.family === familyV4Value) {
            addresses.push(`${net.address}:${PORT}`);
          }
        }
      }

      resolve({ io, server, addresses });
    });
  });
}

createSyncServer()
  .then(({ addresses }) => {
    console.log(chalk.bold.green("Purrfect Server is up and running\n"));

    addresses.forEach((address) => {
      console.log(`${chalk.blue("[ADDR]")} ${chalk.bold.yellow(address)}`);
    });
  })
  .catch((e) => {
    console.log(chalk.bold.red("Failed to Start Purrfect Server\n"));

    console.log(
      chalk.yellow(
        "Please ensure the server isn't running already.\nYou should restart your device if the problem persists. \n"
      )
    );
  });
