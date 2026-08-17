package com.swiftlogistics.notification_service.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // ============================================================
    // TRACKING UPDATED
    // ============================================================

    public static final String TRACKING_EXCHANGE =
            "tracking.updated.exchange";

    public static final String TRACKING_ROUTING_KEY =
            "tracking.updated";

    public static final String TRACKING_QUEUE =
            "notification.tracking.updated.queue";


    // ============================================================
    // ORDER CREATED
    // ============================================================

    public static final String ORDER_EXCHANGE =
            "order.exchange";

    public static final String ORDER_ROUTING_KEY =
            "order.created";

    public static final String ORDER_QUEUE =
            "notification.order.created.queue";


    // ============================================================
    // TRACKING EXCHANGE
    // ============================================================

    @Bean
    public TopicExchange trackingExchange() {
        return new TopicExchange(
                TRACKING_EXCHANGE,
                true,
                false
        );
    }

    @Bean
    public Queue trackingNotificationQueue() {
        return new Queue(
                TRACKING_QUEUE,
                true
        );
    }

    @Bean
    public Binding trackingNotificationBinding(
            Queue trackingNotificationQueue,
            TopicExchange trackingExchange) {

        return BindingBuilder
                .bind(trackingNotificationQueue)
                .to(trackingExchange)
                .with(TRACKING_ROUTING_KEY);
    }


    // ============================================================
    // ORDER EXCHANGE
    // ============================================================

    @Bean
    public TopicExchange orderExchange() {
        return new TopicExchange(
                ORDER_EXCHANGE,
                true,
                false
        );
    }

    @Bean
    public Queue orderNotificationQueue() {
        return new Queue(
                ORDER_QUEUE,
                true
        );
    }

    @Bean
    public Binding orderNotificationBinding(
            Queue orderNotificationQueue,
            TopicExchange orderExchange) {

        return BindingBuilder
                .bind(orderNotificationQueue)
                .to(orderExchange)
                .with(ORDER_ROUTING_KEY);
    }


    // ============================================================
    // RABBITMQ LISTENER
    // ============================================================

    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
            ConnectionFactory connectionFactory) {

        SimpleRabbitListenerContainerFactory factory =
                new SimpleRabbitListenerContainerFactory();

        factory.setConnectionFactory(connectionFactory);

        factory.setDefaultRequeueRejected(false);

        factory.setMessageConverter(
                jacksonJsonMessageConverter()
        );

        return factory;
    }

    @Bean
    public JacksonJsonMessageConverter jacksonJsonMessageConverter() {
        return new JacksonJsonMessageConverter();
    }
}