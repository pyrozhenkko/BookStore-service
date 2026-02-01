package com.epam.rd.autocode.spring.project.conf;

import com.epam.rd.autocode.spring.project.dto.auth.AuthenticationRequest;
import com.epam.rd.autocode.spring.project.model.LogRecord;
import com.epam.rd.autocode.spring.project.repo.LogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j // Дебаг
public class LoggingAspect {

    private final LogRepository logRepository;

    // поінткати
    @Pointcut("execution(* com.epam.rd.autocode.spring.project.service..*(..))")
    public void allServiceMethods() {}

    @Pointcut("execution(* com.epam.rd.autocode.spring.project.service..add*(..)) || " +
            "execution(* com.epam.rd.autocode.spring.project.service..update*(..)) || " +
            "execution(* com.epam.rd.autocode.spring.project.service..delete*(..))")
    public void modificationMethods() {}

    @Pointcut("execution(* com.epam.rd.autocode.spring.project.controller.AuthController.login(..))")
    public void loginMethod() {}

    // тех  логи
    @AfterThrowing(pointcut = "allServiceMethods() || loginMethod()", throwing = "ex")
    public void logTechnicalError(JoinPoint joinPoint, Throwable ex) {
        System.out.println("[ASPECT] Catching exception in: " + joinPoint.getSignature().getName()); // DEBUG

        String methodName = joinPoint.getSignature().getName();
        String className = joinPoint.getTarget().getClass().getSimpleName();

        String username = getCurrentUsername();
        if ("Anonymous/System".equals(username) && joinPoint.getArgs().length > 0) {
            Object arg = joinPoint.getArgs()[0];
            if (arg instanceof AuthenticationRequest) {
                username = ((AuthenticationRequest) arg).getEmail();
            }
        }

        String message = String.format("Exception in %s.%s: %s", className, methodName, ex.getMessage());

        LogRecord log = new LogRecord("TECHNICAL", "ERROR", message, username);
        logRepository.save(log);
    }

    // бізнес логи
    @AfterReturning(pointcut = "modificationMethods()", returning = "result")
    public void logBusinessAction(JoinPoint joinPoint, Object result) {
        String methodName = joinPoint.getSignature().getName();
        String className = joinPoint.getTarget().getClass().getSimpleName();
        String username = getCurrentUsername();
        Object[] args = joinPoint.getArgs();

        String action = determineAction(methodName);
        String argsString = args != null && args.length > 0 ? Arrays.toString(args) : "no args";

        String message = String.format("Business action '%s' success in %s. Data: %s", action, className, argsString);

        LogRecord log = new LogRecord("BUSINESS", "INFO", message, username);
        logRepository.save(log);
    }

    // логи входу
    @AfterReturning(pointcut = "loginMethod()", returning = "result")
    public void logLoginSuccess(JoinPoint joinPoint, Object result) {
        System.out.println("[ASPECT] Login success captured for: " + joinPoint.getSignature().getName()); // DEBUG

        String username = "Unknown";
        Object[] args = joinPoint.getArgs();

        if (args.length > 0 && args[0] instanceof AuthenticationRequest) {
            username = ((AuthenticationRequest) args[0]).getEmail();
        }

        LogRecord log = new LogRecord("SECURITY", "INFO", "User logged in successfully", username);
        LogRecord saved = logRepository.save(log);
        System.out.println("[ASPECT] Log saved with ID: " + saved.getId()); // DEBUG
    }

    // хелпер
    private String getCurrentUsername() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getPrincipal())) {
                return authentication.getName();
            }
        } catch (Exception e) {
            // ignore
        }
        return "Anonymous/System";
    }

    private String determineAction(String methodName) {
        String lower = methodName.toLowerCase();
        if (lower.contains("add")) return "CREATE";
        if (lower.contains("update")) return "UPDATE";
        if (lower.contains("delete")) return "DELETE";
        return "MODIFY";
    }
}