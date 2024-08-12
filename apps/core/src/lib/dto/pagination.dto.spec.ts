import { PaginationDto } from './pagination.dto';

describe('Pagination DTO', () => {
  it('will default to page number 1', () => {
    const dto = new PaginationDto();
    expect(dto.page).toBe(1);
    expect(dto.pageSize).toBe(undefined);
  });
});
