package com.epam.rd.autocode.spring.project.conf;


import com.epam.rd.autocode.spring.project.model.LogRecord;
import com.epam.rd.autocode.spring.project.repo.LogRepository;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;

@Aspect
@Component
@RequiredArgsConstructor
public class LoggingAspect {

    private final LogRepository logRepository;


    @Pointcut("execution(* com.epam.rd.autocode.spring.project.service..*(..))")
    public void allServiceMethods() {}

    // тех логи
    @AfterThrowing(pointcut = "allServiceMethods()", throwing = "ex")
    public void logTechnicalError(JoinPoint joinPoint, Throwable ex) {
        String methodName = joinPoint.getSignature().getName();
        String className = joinPoint.getTarget().getClass().getSimpleName();

        String message = String.format("Exception in %s.%s: %s", className, methodName, ex.getMessage());

        LogRecord log = new LogRecord("TECHNICAL", "ERROR", message, "SYSTEM");
        logRepository.save(log);
    }

    // бізнес логи
    @AfterReturning(pointcut = "execution(* com.epam.rd.autocode.spring.project.service..create*(..))", returning = "result")
    public void logBusinessAction(JoinPoint joinPoint, Object result) {
        String methodName = joinPoint.getSignature().getName();

        String username = "Anonymous User";

        String message = String.format("Business action success: %s", methodName);

        LogRecord log = new LogRecord("BUSINESS", "INFO", message, username);
        logRepository.save(log);
    }
}