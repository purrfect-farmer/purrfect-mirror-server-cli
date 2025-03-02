#!/usr/bin/env node

const pc = require("picocolors");
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
    console.log(
      pc.bold(pc.green("Purrfect Mirror Server is up and running\n"))
    );

    addresses.forEach((address) => {
      console.log(`${pc.blue("[ADDR]")} ${pc.bold(pc.yellow(address))}`);
    });
  })
  .catch((e) => {
    console.log(pc.bold(pc.red("Failed to Start Purrfect Mirror Server\n")));

    console.log(
      pc.yellow(
        "Please ensure the server isn't running already.\nYou should restart your device if the problem persists. \n"
      )
    );
  });
