package com.swiftlogistics.tracking_service.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMqConfig {
    public static final String PACKAGE_STORED_QUEUE = "tracking.package.stored.queue";
    public static final String PACKAGE_STORED_EXCHANGE = "package.stored.exchange";
    public static final String PACKAGE_STORED_ROUTING_KEY = "package.stored";

    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        return objectMapper;
    }

    @Bean
    public Queue packageStoredQueue() {
        return new Queue(PACKAGE_STORED_QUEUE, true);
    }

    @Bean
    public TopicExchange packageStoredExchange() {
        return new TopicExchange(PACKAGE_STORED_EXCHANGE);
    }

    @Bean
    public Binding packageStoredBinding(
            @Qualifier("packageStoredQueue") Queue packageStoredQueue,
            @Qualifier("packageStoredExchange") TopicExchange packageStoredExchange
    ) {
        return BindingBuilder.bind(packageStoredQueue).to(packageStoredExchange).with(PACKAGE_STORED_ROUTING_KEY);
    }

    @Bean
    public MessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter(objectMapper());
    }

    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
            ConnectionFactory connectionFactory,
            MessageConverter messageConverter
    ) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(messageConverter);
        return factory;
    }
}
