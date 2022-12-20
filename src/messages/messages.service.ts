import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Conversation, Message, User} from "../utils/typeorm";
import {Repository} from "typeorm";
import {CreateMessageParams} from "../utils/types";
import {IMessageService} from "./messages";
import {instanceToPlain} from "class-transformer";
@Injectable()
export class MessagesService implements IMessageService{
    constructor(@InjectRepository(Message) private readonly messageRepository: Repository<Message>, @InjectRepository(Conversation) private readonly conversationRepository :Repository<Conversation>,
    ) { }
    async createMessage({
                            user,
                            content,
                            conversationId,
                        }: CreateMessageParams): Promise<Message> {
        const conversation = await this.conversationRepository.findOne({
            where: { id: conversationId },
            relations: ['creator', 'recipient'],
        });
        if (!conversation)
            throw new HttpException('Conversation not found', HttpStatus.BAD_REQUEST);
        const { creator, recipient } = conversation;
        console.log(`User ID: ${user.id}`);
        console.log(conversation);
        if (creator.id !== user.id && recipient.id !== user.id)
            throw new HttpException('Cannot Create Message', HttpStatus.FORBIDDEN);
        conversation.creator = instanceToPlain(conversation.creator) as User;
        conversation.recipient = instanceToPlain(conversation.recipient) as User;
        const newMessage = this.messageRepository.create({
            content,
            conversation,
            author: instanceToPlain(user),
        });
        return this.messageRepository.save(newMessage);
    }



}