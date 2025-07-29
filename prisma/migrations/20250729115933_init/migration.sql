-- CreateTable
CREATE TABLE "Event" (
    "event_id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "start_date" DATE,
    "end_date" DATE,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("event_id")
);

-- CreateTable
CREATE TABLE "User" (
    "user_id" SERIAL NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "EventUser" (
    "event_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "EventUser_pkey" PRIMARY KEY ("event_id","user_id")
);

-- CreateTable
CREATE TABLE "Flet" (
    "flet_id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Flet_pkey" PRIMARY KEY ("flet_id")
);

-- CreateTable
CREATE TABLE "Hotel" (
    "hotel_id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Hotel_pkey" PRIMARY KEY ("hotel_id")
);

-- CreateTable
CREATE TABLE "Destination" (
    "destination_id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Destination_pkey" PRIMARY KEY ("destination_id")
);

-- CreateTable
CREATE TABLE "FlightSchedule" (
    "flight_id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "first_name" VARCHAR(255) NOT NULL,
    "last_name" VARCHAR(255) NOT NULL,
    "flight_number" VARCHAR(50) NOT NULL,
    "arrival_time" TIMESTAMP(3) NOT NULL,
    "property_name" VARCHAR(255) NOT NULL,
    "vehicle_standby_arrival_time" TIMESTAMP(3) NOT NULL,
    "departure_time" TIMESTAMP(3) NOT NULL,
    "vehicle_standby_departure_time" TIMESTAMP(3) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FlightSchedule_pkey" PRIMARY KEY ("flight_id")
);

-- CreateTable
CREATE TABLE "TransportReport" (
    "report_id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransportReport_pkey" PRIMARY KEY ("report_id")
);

-- CreateTable
CREATE TABLE "RealTimeStatus" (
    "status_id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "vehicle_code" VARCHAR(50) NOT NULL,
    "hotel_name" VARCHAR(255) NOT NULL,
    "destination" VARCHAR(255) NOT NULL,
    "guest_name" VARCHAR(255),
    "status" VARCHAR(50) NOT NULL DEFAULT 'dispatched',
    "color" VARCHAR(20) NOT NULL DEFAULT 'green',
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RealTimeStatus_pkey" PRIMARY KEY ("status_id")
);

-- CreateTable
CREATE TABLE "Document" (
    "document_id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "original_name" VARCHAR(255) NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "uploaded_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("document_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "EventUser_event_id_idx" ON "EventUser"("event_id");

-- CreateIndex
CREATE INDEX "EventUser_user_id_idx" ON "EventUser"("user_id");

-- CreateIndex
CREATE INDEX "Flet_event_id_idx" ON "Flet"("event_id");

-- CreateIndex
CREATE INDEX "Hotel_event_id_idx" ON "Hotel"("event_id");

-- CreateIndex
CREATE INDEX "Destination_event_id_idx" ON "Destination"("event_id");

-- CreateIndex
CREATE INDEX "FlightSchedule_event_id_idx" ON "FlightSchedule"("event_id");

-- CreateIndex
CREATE INDEX "FlightSchedule_status_idx" ON "FlightSchedule"("status");

-- CreateIndex
CREATE INDEX "TransportReport_event_id_idx" ON "TransportReport"("event_id");

-- CreateIndex
CREATE INDEX "TransportReport_user_id_idx" ON "TransportReport"("user_id");

-- CreateIndex
CREATE INDEX "RealTimeStatus_event_id_idx" ON "RealTimeStatus"("event_id");

-- CreateIndex
CREATE INDEX "RealTimeStatus_status_idx" ON "RealTimeStatus"("status");

-- CreateIndex
CREATE INDEX "Document_event_id_idx" ON "Document"("event_id");

-- CreateIndex
CREATE INDEX "Document_uploaded_by_idx" ON "Document"("uploaded_by");

-- AddForeignKey
ALTER TABLE "EventUser" ADD CONSTRAINT "EventUser_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("event_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventUser" ADD CONSTRAINT "EventUser_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Flet" ADD CONSTRAINT "Flet_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("event_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hotel" ADD CONSTRAINT "Hotel_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("event_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Destination" ADD CONSTRAINT "Destination_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("event_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlightSchedule" ADD CONSTRAINT "FlightSchedule_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("event_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransportReport" ADD CONSTRAINT "TransportReport_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("event_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransportReport" ADD CONSTRAINT "TransportReport_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RealTimeStatus" ADD CONSTRAINT "RealTimeStatus_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("event_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("event_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
