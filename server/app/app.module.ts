import { Logger, Module } from '@nestjs/common';
// import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
// import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { GameService } from './services/game/game.service';
import { GameController } from './controllers/game/game.controller';
import { DatabaseService } from './services/database/database.service';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        // MongooseModule.forRootAsync({
        //     imports: [ConfigModule],
        //     inject: [ConfigService],
        //     useFactory: async (config: ConfigService) => ({
        //         uri: config.get<string>('DATABASE_CONNECTION_STRING'), // Loaded from .env
        //     }),
        // }),
        // MongooseModule.forFeature([{ name: Course.name, schema: courseSchema }]),
    ],
    controllers: [GameController],
    providers: [Logger, GameService, DatabaseService, ConfigService],
})
export class AppModule {}
