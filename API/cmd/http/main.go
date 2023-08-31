package main

import (
	"fmt"
	"os"
	"time"

	"github.com/FashionApp/config"
	_ "github.com/FashionApp/docs"
	"github.com/FashionApp/internal/clothes"
	"github.com/FashionApp/internal/storage"
	"github.com/FashionApp/pkg/shutdown"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/swagger"
)

// @title Fashion App
// @version 2.0
// @description Fashion app MVP
// @contact.name Gabriel
// @license.name MIT
// @BasePath /
func main() {
	var exitCode int
	defer func() {
		os.Exit(exitCode)
	}()

	env, err := config.LoadConfig()
	if err != nil {
		fmt.Printf("error: %v", err)
		exitCode = 1
		return
	}

	cleanup, err := run(env)

	defer cleanup()
	if err != nil {
		fmt.Printf("error: %v", err)
		exitCode = 1
		return
	}

	shutdown.Gracefully()
}

func run(env config.EnvVars) (func(), error) {
	app, cleanup, err := buildServer(env)
	if err != nil {
		return nil, err
	}

	// start the server
	go func() {
		app.Listen("0.0.0.0:" + env.PORT)
	}()

	// return a function to close the server and database
	return func() {
		cleanup()
		app.Shutdown()
	}, nil
}

func buildServer(env config.EnvVars) (*fiber.App, func(), error) {
	// init the storage
	db, err := storage.BootstrapMongo(env.MONGODB_URI, env.MONGODB_NAME, 10*time.Second)
	if err != nil {
		return nil, nil, err
	}

	// create the fiber app
	app := fiber.New()

	// add middleware
	app.Use(cors.New())
	app.Use(logger.New())

	// add health check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.SendString("Healthy!")
	})

	// add docs
	app.Get("/swagger/*", swagger.HandlerDefault)

	clothesStore := clothes.NewClothesStorage(db)
	clothesController := clothes.NewClothesController(clothesStore)
	clothes.AddClothesRoutes(app, clothesController)

	return app, func() {
		storage.CloseMongo(db)
	}, nil
}
