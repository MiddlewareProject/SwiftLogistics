package com.swiftlogistics.ROS_Adapter.config;

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
    // Dedicated queue name (not "order.created.queue") so RabbitMQ fans this out as its own
    // independent copy of each OrderCreated event, rather than competing with CMS_Adapter's
    // consumer for messages on a shared queue.
    public static final String ORDER_CREATED_QUEUE = "ros.order.created.queue";
    public static final String ORDER_EXCHANGE = "order.exchange";
    public static final String ORDER_ROUTING_KEY = "order.created";

    public static final String ROUTE_GENERATED_QUEUE = "route.generated.queue";
    public static final String ROUTE_GENERATED_EXCHANGE = "route.generated.exchange";
    public static final String ROUTE_GENERATED_ROUTING_KEY = "route.generated";

    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
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

    @Bean
    public Queue routeGeneratedQueue() {
        return new Queue(ROUTE_GENERATED_QUEUE, true);
    }

    @Bean
    public TopicExchange routeGeneratedExchange() {
        return new TopicExchange(ROUTE_GENERATED_EXCHANGE);
    }

    @Bean
    public Binding routeGeneratedBinding(
            @Qualifier("routeGeneratedQueue") Queue routeGeneratedQueue,
            @Qualifier("routeGeneratedExchange") TopicExchange routeGeneratedExchange
    ) {
        return BindingBuilder.bind(routeGeneratedQueue).to(routeGeneratedExchange).with(ROUTE_GENERATED_ROUTING_KEY);
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
