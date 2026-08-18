package com.swiftlogistics.CMS_Adapter.config;

import com.fasterxml.jackson.databind.DeserializationFeature;
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
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Qualifier;

@Configuration
public class RabbitMqConfig {
    public static final String ORDER_CREATED_QUEUE = "order.created.queue";
    public static final String ORDER_EXCHANGE = "order.exchange";
    public static final String ORDER_ROUTING_KEY = "order.created";

    public static final String CMS_COMPLETED_EXCHANGE = "cms.completed.exchange";
    public static final String CMS_COMPLETED_ROUTING_KEY = "cms.completed";

    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        // Tolerate event fields added by other services (e.g. order-service adding a new
        // field) instead of rejecting the whole message - see receiverName incident.
        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        return objectMapper;
    }

    @Bean
    public Queue orderCreatedQueue() {
        return new Queue(ORDER_CREATED_QUEUE, true);
    }

    @Bean
    public TopicExchange orderExchange() {
        return new TopicExchange(ORDER_EXCHANGE);
    }

    @Bean
    public Binding orderBinding(
            @Qualifier("orderCreatedQueue") Queue orderCreatedQueue,
            @Qualifier("orderExchange") TopicExchange orderExchange
    ) {
        return BindingBuilder.bind(orderCreatedQueue).to(orderExchange).with(ORDER_ROUTING_KEY);
    }

    // No queue is bound to this exchange - nothing currently consumes CMSCompleted events.
    // The exchange is kept so publishing doesn't error and a consumer can bind its own
    // queue later without any change here.
    @Bean
    public TopicExchange cmsCompletedExchange() {
        return new TopicExchange(CMS_COMPLETED_EXCHANGE);
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