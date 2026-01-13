package com.epam.rd.autocode.spring.project.mapper;


import com.epam.rd.autocode.spring.project.dto.BookDTO;
import com.epam.rd.autocode.spring.project.model.Book;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING,
        unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface BookMapper {

    @Mapping(source = "name", target = "name")
    @Mapping(source = "genre", target = "genre")
    @Mapping(source = "ageGroup", target = "ageGroup")
    @Mapping(source = "price", target = "price")
    @Mapping(source = "publicationDate", target = "publicationDate")
    @Mapping(source = "author", target = "author")
    @Mapping(source = "pages", target = "pages")
    @Mapping(source = "characteristics", target = "characteristics")
    @Mapping(source = "description", target = "description")
    @Mapping(source = "language", target = "language")
    BookDTO toDto(Book book);

    @Mapping(target = "id", ignore = true)
    @Mapping(source = "name", target = "name")
    @Mapping(source = "genre", target = "genre")
    @Mapping(source = "ageGroup", target = "ageGroup")
    @Mapping(source = "price", target = "price")
    @Mapping(source = "publicationDate", target = "publicationDate")
    @Mapping(source = "author", target = "author")
    @Mapping(source = "pages", target = "pages")
    @Mapping(source = "characteristics", target = "characteristics")
    @Mapping(source = "description", target = "description")
    @Mapping(source = "language", target = "language")
    Book toEntity(BookDTO bookDTO);
}